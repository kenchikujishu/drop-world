import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { LANGS, SCENES, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getByScene, getSceneCounts, hasScenePage } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from './scenes.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(props: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = getDict(lang);
  return {
    title: dict.browse.scenesTitle,
    description: dict.browse.scenesLead,
    alternates: {
      canonical: absoluteUrl(`/${lang}/scenes`),
      languages: { en: absoluteUrl('/en/scenes'), ja: absoluteUrl('/ja/scenes') },
    },
  };
}

/** シーンの一覧。シーンごとに、そのシーンの商品を数点ずつ並べる。 */
export default async function ScenesPage(props: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await props.params;
  const dict = getDict(lang);
  const counts = getSceneCounts();
  const scenes = SCENES.filter((scene) => (counts[scene.id] ?? 0) > 0);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.meta.siteName}</p>
          <h1>{dict.browse.scenesTitle}</h1>
          <p className="lead">{dict.browse.scenesLead}</p>
        </div>
      </div>

      <div className="container">
        {scenes.length === 0 ? (
          <p className={styles.empty}>{dict.browse.empty}</p>
        ) : (
          scenes.map((scene) => (
            <section key={scene.id} className={styles.sceneSection}>
              <div className={styles.sceneHead}>
                <h2 className={styles.sceneTitle}>{scene.label[lang]}</h2>
                {hasScenePage(scene.id) && (
                  <Link href={href(lang, `/scenes/${scene.id}`)} className={styles.sceneLink}>
                    {dict.common.browseAll} →
                  </Link>
                )}
              </div>
              <ProductGrid
                products={getByScene(scene.id).slice(0, 4)}
                lang={lang}
                dict={dict}
              />
            </section>
          ))
        )}
      </div>
    </>
  );
}
