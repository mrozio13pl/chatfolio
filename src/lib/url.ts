import { withoutProtocol, withoutTrailingSlash } from 'ufo';
import isLocalhostIp from 'is-localhost-ip';
import isValidDomainModule from 'is-valid-domain';
import punycode from 'punycode/';
import type { NextRequest } from 'next/server';

export { withoutProtocol } from 'ufo';

export async function isLocalhost(ip: string) {
    return await isLocalhostIp(punycode.toASCII(ip));
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
