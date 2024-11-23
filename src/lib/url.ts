import { withoutProtocol, withoutTrailingSlash } from 'ufo';
import isValidDomainModule from 'is-valid-domain';
import punycode from 'punycode/';
import type { NextRequest } from 'next/server';

export { withoutProtocol } from 'ufo';

export function isLocalhost(ip: string) {
    // from: https://github.com/Kikobeats/localhost-url-regex
    return /^https?:\/\/(localhost|0|10|127|192(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1?\])/gi.test(
        punycode.toASCII(ip),
    );
}

export function isValidDomain(domain: string) {
    return isValidDomainModule(withoutProtocol(domain), { allowUnicode: true });
}

function stripWWW(domain: string) {
    return domain.replace(/^www\./, '');
}

export function addProtocolToDomain(domain: string): string {
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        return `https://${domain}`;
    }
    return domain;
}

export function getDomainFromUrl(href: string): string {
    const url = new URL(addProtocolToDomain(href));

    return stripWWW(withoutProtocol(withoutTrailingSlash(`${url.origin}`)));
}

export function getRequestOrigin(req: NextRequest) {
    const { headers } = req;
    const origin =
        headers.get('origin')?.split(',')[0] || headers.get('referrer');

    if (!origin) return;

    return getDomainFromUrl(origin);
}
