import Link from 'next/link';
import { Navbar } from '~/components/navbar';
import { Section } from '~/components/section';

export default function NotFound() {
    return (
        <Section>
            <Navbar />
            <h1 className="text-9xl font-primary text-secondary font-bold">
                404
            </h1>
            <p>
                This page does not exist, go back{' '}
                <Link href="/" className="underline">
                    home
                </Link>
                .
            </p>
        </Section>
    );
}
