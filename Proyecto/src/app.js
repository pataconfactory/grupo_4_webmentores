// ************ Require's************
const express = require('express');
const path = require('path');
const productRoutes = require('./routes/products');
const mainRoutes = require('./routes/main');
const methodOverride =  require('method-override');


// ************ express()************
const app = express();

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));

//************ Template Engine************
const viewsPath = path.join(__dirname, './views');
app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use('/', mainRoutes);
app.use('/products', productRoutes);

app.listen(3000, ()  => {
    console.log('IMentor está corriendo');
});