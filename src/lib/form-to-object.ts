import arrify from 'arrify';

function isNumeric(str: string) {
    if (typeof str !== 'string') return false;

    return (
        !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    );
}

export function formToObject(
    formData: FormData,
    fields: { string?: string[]; number?: string[]; boolean?: string[] } = {},
) {
    const dataObject = {} as any;

    formData.forEach((value, key) => {
        const isArrayKey = key.endsWith('[]');
        const sanitizedKey = isArrayKey ? key.slice(0, -2) : key;

        if (isArrayKey) {
            dataObject[sanitizedKey] = arrify(dataObject[sanitizedKey]);
            dataObject[sanitizedKey].push(value);
        } else {
            if (dataObject[sanitizedKey]) {
                if (Array.isArray(dataObject[sanitizedKey])) {
                    dataObject[sanitizedKey].push(value);
                } else {
                    dataObject[sanitizedKey] = [
                        dataObject[sanitizedKey],
                        value,
                    ];
                }
            } else {
                if (
                    typeof value === 'string' &&
                    fields?.boolean?.includes(sanitizedKey)
                ) {
                    dataObject[sanitizedKey] = value === 'on';
                } else {
                    dataObject[sanitizedKey] =
                        !fields?.string?.includes(sanitizedKey) &&
                        isNumeric(value as string)
                            ? +value
                            : value;
                }
            }
        }
    });

    return dataObject;
}
