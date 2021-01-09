import {
  Expression,
  arrayExpression,
  nullLiteral,
  objectExpression,
  objectProperty,
  identifier,
  stringLiteral,
  NumericLiteral,
  booleanLiteral,
} from "@opah/core";

export function toAST(obj: any): Expression {
  if (typeof obj === "object") {
    if (obj instanceof Array) {
      return arrayExpression(obj.map(toAST));
    } else if (obj === null) {
      return nullLiteral();
    } else {
      return objectExpression(
        Object.entries(obj).map(([key, value]) =>
          objectProperty(identifier(key), toAST(value))
        )
      );
    }
  } else if (typeof obj === "string") {
    return stringLiteral(obj);
  } else if (typeof obj === "number") {
    return <NumericLiteral>{
      type: "NumericLiteral",
      value: obj,
    };
  } else if (typeof obj === "undefined") {
    return identifier("undefined");
  } else if (typeof obj === "boolean") {
    return booleanLiteral(obj);
  } else {
    throw new Error("unknown " + typeof obj);
  }
}
