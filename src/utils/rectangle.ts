import type {Vec2} from "../types";

/**
 * Rectangle class representing a rectangle defined by four points.
 * The points are expected to be in the order: top-left, top-right, bottom-right, bottom-left.
 */
export default class Rectangle {
    points: [Vec2, Vec2, Vec2, Vec2];

    constructor(points: [Vec2, Vec2, Vec2, Vec2]) {
        if (points.length !== 4) throw new Error("Wrong number of vertices for a rectangle. Expected 4, but got " + points.length);
        this.points = points;
    }

    get topLeft() {return this.points[0];}
    get topRight() {return this.points[1];}
    get bottomRight() {return this.points[2];}
    get bottomLeft() {return this.points[3];}

    get x() {return this.topLeft[0];}
    get y() {return this.topLeft[1];}

    get width() {return this.topRight[0] - this.topLeft[0];}
    get height() {return this.topLeft[1] - this.bottomLeft[1];}

    collides(other: Rectangle) {
        const withinLeft = this.x < other.x + other.width;
        const withinRight = this.x + this.width > other.x;
        const withinUp = this.y > other.y - other.height;
        const withinDown = this.y - this.height < other.y;
        return withinLeft && withinRight && withinUp && withinDown;
    }
}