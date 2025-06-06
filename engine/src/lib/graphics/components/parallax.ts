import { Component } from "../../ecs/component";

export class Parallax extends Component {
	constructor(public factor: number = 1) {
		super();
	}
}
