describe("json parse errors", () => {
    it("tsconfig.json should parse correctly", () => {
        const json = "{\n" +
            "   \"compilerOptions\": {\n" +
            "      \"lib\": [\n" +
            "         \"es5\",\n" +
            "         \"es6\"\n" +
            "      ],\n" +
            "      \"target\": \"es5\",\n" +
            "      \"module\": \"commonjs\",\n" +
            "      \"moduleResolution\": \"node\",\n" +
            "      \"outDir\": \"./build\",\n" +
            "      \"emitDecoratorMetadata\": true,\n" +
            "      \"experimentalDecorators\": true,\n" +
            "      \"sourceMap\": true\n" +
            "   }\n" +
            "}\n"

        const result = JSON.parse(json);

        expect(result.compilerOptions.target).toBe('es5');
    });
})
