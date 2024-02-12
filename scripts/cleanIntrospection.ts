import {
  getIntrospectedSchema,
  minifyIntrospectionQuery,
} from "@urql/introspection";
import fs from "fs";
import path from "path";

const filepath = path.resolve(process.argv[2] ?? "");
const file = fs.readFileSync(filepath, "utf-8");
const data = JSON.parse(file);
const minified = minifyIntrospectionQuery(getIntrospectedSchema(data));

fs.writeFileSync(filepath, JSON.stringify(minified, null, 2));
