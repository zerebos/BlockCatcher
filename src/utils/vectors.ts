import type {Vec2, Vec3, Vec4} from "../types";

/**
 * Utility function to create a vector of a specified length, filling with zeros if necessary.
 * @param elements - The initial elements of the vector.
 * @param length - The desired length of the vector.
 * @returns A vector of the specified length, filled with zeros if necessary.
 */
export default function vec(elements: number[], length = 0) {
    return elements.concat(Array(length).fill(0)).slice(0, length);
}

export function vec2(...elements: number[]): Vec2 {
    return vec([...elements], 2) as Vec2;
}

export function vec3(...elements: number[]): Vec3 {
    return vec([...elements], 3) as Vec3;
}

export function vec4(...elements: number[]): Vec4 {
    return vec([...elements], 4) as Vec4;
}