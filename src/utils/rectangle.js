export default class Rectangle {
    constructor(points) {
        if (points.length !== 4) throw new Error("Wrong number of vertices for a rectangle. Expected 4, but got " + points.length);
        this.points = points;
    }

    get topLeft() {return this.points[0];}
    get topRight() {return this.points[1];}
    get bottomLeft() {return this.points[2];}
    get bottomRight() {return this.points[3];}

    get x() {return this.topLeft[0];}
    get y() {return this.topLeft[1];}

    get width() {return this.topRight[0] - this.topLeft[0];}
    get height() {return this.topLeft[1] - this.bottomLeft[1];}

    collides(other) {
        const withinLeft = this.x < other.x + other.width;
        const withinRight = this.x + this.width > other.x;
        const withinUp = this.y > other.y - other.height;
        const withinDown = this.y - this.height < other.y;        
        return withinLeft && withinRight && withinUp && withinDown;
    }
}