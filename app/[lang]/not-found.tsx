import Link from 'next/link';

/**
 * 言語セグメント配下の 404。ヘッダーとフッターはレイアウトが描画するので、
 * ここは本文だけ。リンク先は既定言語（英語）に固定する —— 存在しない URL では
 * どちらの言語を意図していたか判断できないため。
 */
export default function NotFound() {
  return (
    <div className="container-narrow" style={{ paddingBlock: '6rem 8rem' }}>
      <p className="kicker">404</p>
      <h1 style={{ fontSize: 'var(--step-4)', marginTop: '0.75rem' }}>Page not found</h1>
      <p style={{ marginTop: '1rem', color: 'var(--ink-70)', maxWidth: '52ch' }}>
        The page you were looking for does not exist, or has moved. ページが見つかりませんでした。
      </p>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/en/products" className="btn">
          Browse all products
        </Link>
      </p>
    </div>
  );
}
