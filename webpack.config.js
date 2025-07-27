const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const Dotenv = require('dotenv-webpack');
const webpackBar = require('webpackbar');

// 执行这段代码，加载环境变量
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });


module.exports = (env) => {
    return {
        // stats: 'minimal',
        stats: {
            colors: true, // 输出颜色
            modules: false, // 不显示模块信息
            children: false, // 不显示子模块信息
            chunks: true, // 不显示chunks信息
            chunkModules: true, // 不显示chunk模块信息
            assets: false, // 显示资源信息
            hash: false, // 不显示hash值
            version: false, // 不显示版本信息
            timings: false, // 显示构建时间等信息
            builtAt: false, // 显示构建时间
            errors: true, // 显示错误
            errorDetails: true, // 显示错误详情
            warnings: true, // 显示警告
            publicPath: true // 不显示publicPath信息
        },
        mode: 'production',
        // 入口文件
        entry: './src/main.ts',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
        },
        //输出配置
        output: {
            filename: `[name]-${new Date().getTime()}.js`, // 输出的文件名
            path: path.resolve(__dirname, 'dist') // 输出的路径
        },
        // // 开发工具，帮助映射压缩后的代码回原始源代码
        // devtool: 'inline-source-map',
        // 模块规则（loader）
        module: {
            rules: [

                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/, // 排除node_modules目录
                    options: { appendTsSuffixTo: [/\.vue$/] }, // 添加这行,使ts-loader处理vue文件
                },

                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader', // 将计算后的样式加入到DOM中
                        'css-loader',   // 将CSS转化为CommonJS模块
                        // 'sass-loader'   // 将Sass编译成CSS
                    ]
                },
                {
                    test: /\.css$/, // 正则表达式匹配.css文件
                    use: [
                        'style-loader', // 将JS字符串生成为style节点
                        'css-loader' // 将CSS转化成CommonJS模块
                    ]
                },
                {
                    test: /\.js$/, // 正则表达式匹配.js文件
                    exclude: /node_modules/, // 排除node_modules目录
                    use: {
                        loader: 'babel-loader', // 使用babel-loader来转译JS文件
                        options: {
                            presets: ['@babel/preset-env'] // 使用@babel/preset-env预设来转译JS代码
                        }
                    }
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/, // 正则表达式匹配图片文件
                    use: [
                        'url-loader', // url-loader: 打包文件到静态资源
                        // 'file-loader' // 使用file-loader来处理图片文件会打包成base64文件
                    ]
                },

            ]
        },
        // 插件配置
        plugins: [
            // 
            new webpackBar(),
            new CleanWebpackPlugin(), // 清除构建目录
            // 可以在这里添加插件，例如 HtmlWebpackPlugin 来自动生成 HTML 文件，并自动引入打包生成的 JS 文件。
            // 添加vue-loader插件
            new VueLoaderPlugin(),
            // 添加获取系统环境变量插件
            new Dotenv({
                path: `.env.${process.env.NODE_ENV}`, // 根据环境加载不同的 .env 文件
                safe: false, // 使用 .env.example 作为默认值
                systemvars: true, // 允许使用系统环境变量
            }),
            // 添加html模板插件
            new HtmlWebpackPlugin({
                templateParameters: {
                    BASE_URL: process.env.BASE_URL,
                },
                template: 'public/index.html' // 指定模板文件的位置和名称
            }),
            // 添加静态资源拷贝插件
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'public/favicon.ico', to: '' }, // 从public复制到输出目录的根目录
                    { from: 'public/img', to: 'img' },
                ],
            }),


        ],
        // 开发服务器配置，用于开发环境
        devServer: {
            contentBase: './dist', // 开发服务器的基础路径
            hot: true // 启用模块热替换(HMR)功能
        }
    }
};

