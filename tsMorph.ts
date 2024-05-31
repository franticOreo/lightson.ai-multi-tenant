import { Project } from "ts-morph";

function analyzeSourceFiles() {
    const project = new Project();
    project.addSourceFilesAtPaths("src/**/*.ts");

    const sourceFiles = project.getSourceFiles();

    sourceFiles.forEach(sourceFile => {
        const functions = sourceFile.getFunctions();
        functions.forEach(func => {
            console.log(`Function: ${func.getName()}`);
            console.log(`Parameters: ${func.getParameters().map(p => p.getName())}`);
            console.log(`Return Type: ${func.getReturnType().getText()}`);
        });
    });
}

// Call the function to trigger the code
analyzeSourceFiles();