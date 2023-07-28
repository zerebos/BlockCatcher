export default function vec(elements, length = 0) {
    return elements.concat(Array(length).fill(0)).slice(0, length);
}

export function vec2() {
    return vec([...arguments], 2);
}

export function vec3() {
    return vec([...arguments], 3);
}

export function vec4() {
    return vec([...arguments], 4);
}