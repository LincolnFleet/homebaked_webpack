const fs = require("fs");
const path = require("path");
const babylon = require("babylon");
const babelTraverse = require("babel-traverse").default;
const { transformFromAst } = require("@babel/core");

// id for naming mapped files
let fileUID = 0;

function createDependencyList(filepath) {
    // read file contents as string
    const fileContents = fs.readFileSync(filepath, "utf-8");
    // use babylon to create AST from code string
    const AST = babylon.parse(fileContents, {sourceType: 'module'});
    const dependencies = [];
    // use babel to traverse the AST, 
    // running a trap fn for every import statement to add 
    // its target to the file's list of dependencies
    babelTraverse( 
        AST, 
        { ImportDeclaration: ({node}) => dependencies.push(node.source.value) },
    );
    return {
        // use babel to transform AST back to code, but in
        // a more widely used format among browsers
        code: transformFromAst( AST, null, { presets: ["env"] } ),
        id: fileUID++,
        filepath,
        dependencies
    };
}

