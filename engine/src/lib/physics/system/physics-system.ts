import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import Vector2 from "../../math/vector2";
import { RigidBody } from "../components/rigid-body";
import { BodyType } from "../enum/body-type";



export class PhysicsSystem extends System {
	dynamic(deltaTime: number, rigidBody: RigidBody) {
		// Reset acceleration
		rigidBody.acceleration.set(0, 0);
		// Aplicar gravedad
	
			rigidBody.applyGravity(rigidBody.gravity);
		

		// Fricción por contacto (sólo eje X)
		const friction = rigidBody.velocity.x * -rigidBody.friction;
		rigidBody.addForce(new Vector2(friction, 0));

		// Drag (resistencia del aire)
		const drag = rigidBody.velocity.clone().scale(-rigidBody.dragScale);
		rigidBody.addForce(drag);

		// Calcular aceleración
		for (const force of rigidBody.forces) {
			rigidBody.acceleration.x += force.x / rigidBody.mass;
			rigidBody.acceleration.y += force.y / rigidBody.mass;
		}

		// Actualizar velocidad
		rigidBody.velocity.x += rigidBody.acceleration.x * deltaTime;
		rigidBody.velocity.y += rigidBody.acceleration.y * deltaTime;

		// Se aplica epsilon para evitar problemas de redondeo debido a residuos de fuerzas que no permiten que la velocidad sea 0 y la aceleración 0 ( fuerzas residuales: fricción, drag, gravedad )
		const epsilon = 0.05;

		if (Math.abs(rigidBody.velocity.x) < epsilon) {
			rigidBody.velocity.x = 0;
		}
		if (Math.abs(rigidBody.velocity.y) < epsilon) {
			rigidBody.velocity.y = 0;
		}
		// Actualizar posición
		rigidBody.gameObject.transform.position.x += rigidBody.velocity.x * deltaTime;
		rigidBody.gameObject.transform.position.y += rigidBody.velocity.y * deltaTime;

		// Limpiar fuerzas
		rigidBody.forces = [];
	}
	update(deltaTime: number, entities: Set<Entity>): void {
		const entitiesArr = Array.from(entities);
		const rigidBodies = entitiesArr.filter((e) => e.hasComponent(RigidBody));

		rigidBodies.forEach((entity) => {
			const rigidBody = entity.getComponent(RigidBody);
			switch (rigidBody.bodyType) {
				case BodyType.Dynamic:
					this.dynamic(deltaTime, rigidBody);
					break;
				case BodyType.Static:
					break;
				case BodyType.Kinematic:
					break;
			}

			// // PONER UN SUELO TEMPORAL
			// if (rigidBody.gameObject.transform.position.y > 200) {
			// 	rigidBody.gameObject.transform.position.y = 200;
			// 	rigidBody.velocity.y = 0;
			// }
		});
	}
}
