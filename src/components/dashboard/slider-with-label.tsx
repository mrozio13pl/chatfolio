import React, { useState } from 'react';
import { Slider } from '~/components/ui/slider';

export function SliderWithLabel({
    ...props
}: React.ComponentProps<typeof Slider>) {
    const [value, setValue] = useState(props.defaultValue?.[0] ?? 0);

    return (
        <div className="space-y-2">
            <span className="text-content-100">{value}</span>
            <Slider {...props} onValueChange={(v) => setValue(v[0])} />
        </div>
    );
}
