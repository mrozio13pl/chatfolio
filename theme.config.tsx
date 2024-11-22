/* eslint-disable import/no-anonymous-default-export */
import { useConfig, type DocsThemeConfig } from 'nextra-theme-docs';
import { Logo } from '~/components/logo';

/* eslint sort-keys: error */
export default {
    docsRepositoryBase:
        'https://github.com/mrozio13pl/chatfolio/tree/main/src/pages/docs',
    editLink: {
        content: 'Edit this page on GitHub',
    },
    faviconGlyph: '💼',
    color: {
        hue: 46,
    },
    head: function useHead() {
        const config = useConfig();
        const title = `${config.title} – Chatfolio`;
        const description = 'Chatfolio: Your personalized chatbot about you';
        const image = config.frontMatter.image;
        return (
            <>
                <title>{title}</title>
                <meta property="og:title" content={title} />
                <meta name="description" content={description} />
                <meta property="og:description" content={description} />
                <meta name="og:image" content={image} />

                <meta name="msapplication-TileColor" content="#fff" />
                <meta httpEquiv="Content-Language" content="en" />
                <meta name="apple-mobile-web-app-title" content="Chatfolio" />
                <meta
                    name="msapplication-TileImage"
                    content="/ms-icon-144x144.png"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="https://chatfolio.me/" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-icon-180x180.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="192x192"
                    href="/android-icon-192x192.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="96x96"
                    href="/favicon-96x96.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
            </>
        );
    },
    nextThemes: {
        defaultTheme: 'dark',
    },
    logo: Logo,
} satisfies DocsThemeConfig;
