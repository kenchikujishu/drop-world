import type { Section } from '@/content/i18n/en';
import Prose from './Prose';

/**
 * 利用規約 / プライバシー / 返金ポリシーの共通レイアウト。
 * 3ページとも「見出し + リード + 最終更新日 + 本文」で構造が同じなのでここに寄せる。
 */
export default function LegalDocument({
  kicker,
  doc,
  updatedLabel,
  updatedValue,
}: {
  kicker: string;
  doc: { title: string; lead: string; sections: Section[] };
  updatedLabel: string;
  updatedValue: string;
}) {
  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{kicker}</p>
          <h1>{doc.title}</h1>
          <p className="lead">{doc.lead}</p>
        </div>
      </div>

      <div className="container-narrow prose">
        <p className="updated">
          {updatedLabel}: {updatedValue}
        </p>
        <Prose sections={doc.sections} />
      </div>
    </>
  );
}
