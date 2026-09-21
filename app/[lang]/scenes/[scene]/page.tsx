import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { LANGS, SCENE_IDS, sceneLabel, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { getByScene, hasScenePage } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from '../scenes.module.css';

type Params = { lang: Lang; scene: string };

/** 商品が MIN_PRODUCTS_PER_PAGE 点以上あるシーンだけページを作る。 */
export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    SCENE_IDS.filter((scene) => hasScenePage(scene)).map((scene) => ({ lang, scene })),
  );
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, scene } = await props.params;
  if (!hasScenePage(scene)) return {};

  const dict = getDict(lang);
  const label = sceneLabel(scene, lang);

  return {
    title: `${label} — ${dict.browse.scenesTitle}`,
    description: `${dict.browse.inScene}: ${label}`,
    alternates: {
      canonical: absoluteUrl(`/${lang}/scenes/${scene}`),
      languages: {
        en: absoluteUrl(`/en/scenes/${scene}`),
        ja: absoluteUrl(`/ja/scenes/${scene}`),
      },
    },
  };
}

export default async function ScenePage(props: { params: Promise<Params> }) {
  const { lang, scene } = await props.params;
  if (!hasScenePage(scene)) notFound();

  const dict = getDict(lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.browse.scenesTitle}</p>
          <h1>{sceneLabel(scene, lang)}</h1>
          <p className="lead">
            {dict.browse.inScene}: {sceneLabel(scene, lang)}
          </p>
        </div>
      </div>

      <div className={`container ${styles.sceneSection}`}>
        <ProductGrid products={getByScene(scene)} lang={lang} dict={dict} />
      </div>
    </>
  );
}
