const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const JavascriptObfuscator = require("webpack-obfuscator");
const SetHeader = require("./plugin/SetHeader");
const WatchDeployPlugin = require("./plugin/WatchDeployPlugin");
const CopyPlugin = require('copy-webpack-plugin');
var scriptConfig = require('./scriptConfig.js');

var headerFile = path.resolve(__dirname, scriptConfig.header);
var headerText = fs.readFileSync(headerFile, "utf8").trim();

var dist = "./dist";
var entry = {};
var copyPatterns = [];
scriptConfig.projects.forEach(project => {
  var projectName=project.name;
  var outProjectName=scriptConfig.projectPrefix+project.name;
  var outPathName = path.posix.resolve("/", outProjectName, project.main);
  outPathName = outPathName.replace(".js", "");
  var entryPathName = path.posix.resolve(scriptConfig.baseDir, projectName, project.main);
  entry[outPathName] = entryPathName;
  var fronPath= path.posix.resolve(scriptConfig.baseDir, projectName).replace(/\\/g, '/')+"";
  var toPath= path.posix.resolve(dist, outProjectName).replace(/\\/g, '/')+"";
  var pattern = {
    from: fronPath,
    to:toPath,
    globOptions:{
      ignore: ['**/*.js', '**/*.ts'] 
    }
  };
 // console.error(pattern);
  copyPatterns.push(pattern);
});
module.exports = function (env, argv) {
  return {
    entry: entry,
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, dist),
    },
    target: scriptConfig.target,
    mode: argv.production ? 'production' : 'development',
    devtool: argv.production ? 'source-maps' : 'none',
    plugins: [
      new CleanWebpackPlugin(),
      new JavascriptObfuscator({
        compact: true,
        // // 压缩
        // compact: true,
        // // 控制流扁平化（降低50%速度）
        // controlFlowFlattening: false,
        // // 扁平化使用概率
        // controlFlowFlatteningThreshold: 0.75,
        // // 插入死代码
        // deadCodeInjection: false,
        // // 死代码影响率
        // deadCodeInjectionThreshold: 0.4,
        // // 阻止调试
        // debugProtection: false,
        // // 进阶阻止调试
        // debugProtectionInterval: false,
        // // 禁用console
        // disableConsoleOutput: false,
        // // 锁定代码，使其只能在本域名执行（复制到其他地方难以使用）
        // domainLock: [],
        // // 标识符混淆方式，hexadecimal（十六进制）、mangled（短标识符）
        // identifierNamesGenerator: 'hexadecimal',
        // // 标识符添加特定前缀
        // identifiersPrefix: '',
        // // 允许将信息记录到控制台
        // inputFileName: '',
        // log: false,
        // // 启用全局变量和函数名你的混淆
        // renameGlobals: false,
        // // 禁用模糊处理和生成标识符
        // reservedNames: [],
        // // 禁用数组内字符串的转换
        // reservedStrings: [],
        // // 通过固定和随机的位置移动数组，使解密的位置难以匹配，大文件应重点开启
        // rotateStringArray: true,
        // seed: 0,
        // // 使混淆后的代码无法使用格式美化，需要保证compact为true
        // selfDefending: false,
        // // 生成指引文件
        // sourceMap: false,
        // sourceMapBaseUrl: '',
        // sourceMapFileName: '',
        // sourceMapMode: 'separate',
        // // 删除字符串，并将它们放在一个数组中使用
        // stringArray: true,
        // // 编码字符串
        // stringArrayEncoding: true,
        // // 编码率
        // stringArrayThreshold: 0.75,
        // // 生成的代码环境，可选Browser、Browser No Eval、Node
        // target: 'browser',
        // // 混淆对象键名
        // transformObjectKeys: false,
        // // 转义为Unicode，会大大增加体积，还原也比较容易，建议只对小文件使用
        unicodeEscapeSequence: false,
      }),
      new SetHeader({
        uiMode: scriptConfig.uiMode,
        base64: scriptConfig.base64,
        advancedEngines: scriptConfig.advancedEngines,
        header: headerText
      }),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
        protectWebpackAssets: false,
        cleanOnceBeforeBuildPatterns: [],
        cleanAfterEveryBuildPatterns: ["bundle.js"],
      }),
      new CopyPlugin({
        patterns: copyPatterns,
      
      }),
      new WatchDeployPlugin({
        type:scriptConfig.watch
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "webpack-autojs-loader",
            },
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
          },
        },
      ],
    },
  };
}
// console.log(result)
