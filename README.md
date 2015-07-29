# Model View Projection
## Understanding WebGL coordinate spaces

This content kit explores how to take data within a WebGL project, and project it into the proper spaces to display it on the screen. It assumes a knowledge of basic matrix math using translation, scale, and rotation matrices. It explains the three core matrices that are typically used to represent a 3d object: the model, view and projection matrices.

Lesson                  | JSFiddle                                                 | Code                                                    | Time Estimation |
----------------------- | ---------------------------------------------------------| ---------------------------------------------------------------- | ------ |
Clip Space              | [JSFiddle](https://jsfiddle.net/tatumcreative/2x03hdc8/) | [01-clip-space](lessons/01-clip-space)                           | 15 min |
Homogeneous Coordinates | [JSFiddle](https://jsfiddle.net/tatumcreative/mff99yu5/) | [02-homogeneous-coordinates](lessons/02-homogeneous-coordinates) | 15 min |
Model Matrix            | [JSFiddle](https://jsfiddle.net/tatumcreative/5jofzgsh/) | [03-model-transform](lessons/03-model-transform)                 | 15 min |
Divide by W             | [JSFiddle](https://jsfiddle.net/tatumcreative/vk9r8h2c/) | [04-divide-by-w](lessons/04-divide-by-w)                         | 15 min |
Simple Projection       | [JSFiddle](https://jsfiddle.net/tatumcreative/zwyLLcbw/) | [05-simple-projection](lessons/05-simple-projection)             | 15 min |
Perspective Matrix      | [JSFiddle](https://jsfiddle.net/tatumcreative/Lzxw7e1q/) | [06-perspective-matrix](lessons/06-perspective-matrix)           | 15 min |
View Matrix             | [JSFiddle](https://jsfiddle.net/tatumcreative/86fd797g/) | [07-view-matrix](lessons/07-view-matrix)                         | 15 min |

## Getting started (10 min)

The lessons can either be worked online from JSFiddle, or downloaded and explored locally. The content of the lessons is mixed in with the code. The `script.js` files contain most of the lesson, while the `index.html` contains the HTML and shader code. To download these files either [grab the zip file](https://github.com/TatumCreative/mdn-model-view-projection/archive/master.zip) or run `git clone git@github.com:TatumCreative/mdn-model-view-projection.git` from the command line.

#### Working locally checklist

 1. Verify that [WebGL works on your machine](https://get.webgl.org/).
 2. Download the lesson files to your machine.
 3. Open the lessons in the browser:
   * Either open the index.html files from the lessons in your browser
   * Or if you are serving files with a local webserver, make sure and serve them from the root directory of the content kit so that the shared js files can be correctly loaded in.

#### Working on JSFiddle checklist

 1. Verify that [WebGL works on your machine](https://get.webgl.org/).
 2. Visit the JSFiddle links

## Lesson requirements

These lessons require a [browser and device that support WebGL](https://get.webgl.org/). The browsers that support these features are Firefox 4+, Google Chrome 9+, Opera 12+, Safari 5.1+ and Internet Explorer 11+. Be aware that not all devices support WebGL even if the browsers do. There are many tutorials available throughout the web on graphics programming, but this content kit specifically targets web developers. It's assumed that the audience is familiar with an intermediate level web development, markup, and JavaScript.

## Updates and Correction

[Submit an issue](./issues) or a [pull request](https://help.github.com/articles/using-pull-requests/) for any corrections or updates. For a history of the updates visit the [commit history](https://github.com/TatumCreative/mdn-model-view-projection/commits/master).