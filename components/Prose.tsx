import type { Section } from '@/content/i18n/en';

/**
 * 法務ページ・About・ライセンスの本文を描画する。
 * body の各要素は段落。行頭が "- " の要素は箇条書き項目として扱う。
 * 見た目は globals.css の `.prose` が持つ。
 */
export default function Prose({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {groupBlocks(section.body).map((block, index) =>
            block.type === 'list' ? (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={index}>{block.text}</p>
            ),
          )}
        </section>
      ))}
    </>
  );
}

type Block = { type: 'p'; text: string } | { type: 'list'; items: string[] };

/** 連続する "- " 行を1つの <ul> にまとめる。 */
function groupBlocks(body: string[]): Block[] {
  const blocks: Block[] = [];

  for (const line of body) {
    if (line.startsWith('- ')) {
      const item = line.slice(2);
      const last = blocks[blocks.length - 1];
      if (last?.type === 'list') last.items.push(item);
      else blocks.push({ type: 'list', items: [item] });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }

  return blocks;
}
