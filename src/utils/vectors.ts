export default function vec<T>(elements: T[], length = 0) {
    return elements.concat(Array(length).fill(0)).slice(0, length);
}

export function vec2<T>(...elements: T[]) {
    return vec<T>([...elements], 2);
}

export function vec3<T>(...elements: T[]) {
    return vec<T>([...elements], 3);
}

export function vec4<T>(...elements: T[]) {
    return vec<T>([...elements], 4);
}