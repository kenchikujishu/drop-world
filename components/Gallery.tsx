'use client';

import { useState } from 'react';
import styles from './gallery.module.css';

export default function Gallery({ images, alt, label }: { images: string[]; alt: string; label: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={alt} width={1200} height={900} />
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbs} aria-label={label}>
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                className={styles.thumb}
                onClick={() => setActive(index)}
                aria-current={index === active ? 'true' : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" width={200} height={150} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
