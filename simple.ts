import { console } from "console";
import { foo } from "./another.ts";

export default function () {
	console.log(foo());
}
