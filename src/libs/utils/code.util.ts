export function cppChangeContent(content: string) {
    // content = content.trim();
    // content = "#include <time.h>\n" + content; 
    // const index = content.indexOf(";");
    // const start = 'c' + require('uuid').v1().replaceAll("-","");
    // const end = 'c' + require('uuid').v1().replaceAll("-","");
    // content = content.substring(0, index+1) + `\nint ${start} = clock();\n` + content.substring(index+1);
    // if(content.match(/main[ ]{0,}\([ ]{0,}\)[ ]{0,}{[ ]{0,}[\W]{1,}[\Wa-zA-Z0-9]{1,}return[ ]{1,}0[ ]{0,};/g)) {
    //     const index = content.lastIndexOf("return");
    //     content = content.substring(0, index) + `int ${end} = clock(); cout<<endl; cout<<fixed<<setprecision(5)<<(float)(${end} - ${start})/CLOCKS_PER_SEC;` + content.substring(index);
    // } else {
    //     content = content.substring(0, content.length - 1) + `int ${end} = clock(); cout<<endl; cout<<fixed<<setprecision(5)<<(float)(${end} - ${start})/CLOCKS_PER_SEC;}`; 
    // }
    return content;
}

export function javaChangeContent(content: string) {
    return content;
}