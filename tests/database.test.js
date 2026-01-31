const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(__dirname, "../database.schema.json");
const dbPath = path.resolve(__dirname, "../database.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("Database Validation", () => {
    test("database.json should satisfy the schema", () => {
        const valid = validate(data);
        if (!valid) {
            console.error(validate.errors);
        }
        expect(valid).toBe(true);
    });

    test("Severity levels should be valid", () => {
        const allowed = ["critical", "warning", "info"];
        Object.values(data).forEach(entry => {
            if (entry.severity) {
                expect(allowed).toContain(entry.severity);
            }
        });
    });

    test("Proof URLs should be valid URLs", () => {
        Object.values(data).forEach(entry => {
            expect(() => new URL(entry.proof_url)).not.toThrow();
        });
    });
});
