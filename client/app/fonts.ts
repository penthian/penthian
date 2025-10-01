// app/fonts.ts
import localFont from 'next/font/local';
import { Afacad, Newsreader } from 'next/font/google';

export const satoshi = localFont({
    src: [
        { path: './assets/fonts/Satoshi-Light.woff2', weight: '300', style: 'normal' },
        { path: './assets/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
        { path: './assets/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
        { path: './assets/fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
        { path: './assets/fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
    ],
});

// export const amstelvaralpha = localFont({
//     src: [{ path: './assets/fonts/AmstelvarAlpha.woff2', weight: '400', style: 'normal' }],
//     variable: '--font-amstel',
// });

export const afacad = Afacad({
    subsets: ['latin'],
    variable: '--font-afacad',
});

export const newsreader = Newsreader({
    subsets: ['latin'],
    variable: '--font-newsreader',
});
