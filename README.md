# Color Dropper

Color Dropper is a simple web application that allows you to pick colors from a canvas.

## Customizing Canvas Size

The initial size of the canvas is set to 1000x500 pixels. If you want to modify the size, follow these steps:

1. Open the `index.html` file.
2. Change both the `eyeDropper` and `background` canvas sizes to your preferred dimensions.

```html
<canvas id="eyeDropper" width="yourWidth" height="yourHeight"></canvas>
<canvas id="background" width="yourWidth" height="your height"></canvas>
````
3. Open the styles.css file.
4. Find the .stage class and adjust the width and height properties to match the dimensions you used in the previous step.

```css
.stage {
    width: yourWidth;
    height: yourHeight;
}
```

## Running the Code
To run the Color Dropper application:

1. Navigate to the root directory of the project.
2. Run `npm install`
3. Run `npm start`

The application will start running, and you can access it through your web browser.

