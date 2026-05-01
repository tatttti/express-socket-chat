import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import {
    getAll, getById, create, updateById, deleteById
} from './store.js';

export const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/items-page', async (req, res) => {
    let items = await getAll();

    const search = req.query.search || "";
    if (search) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    const sort = req.query.sort || "";
    if (sort === "name") {
        items.sort((a, b) => a.name.localeCompare(b.name));
    }

    const page = Number(req.query.page) || 1;
    const limit = 5;
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const safePage = Math.min(Math.max(1, page), totalPages);

    const start = (safePage - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    res.render('list', {
        items: paginatedItems,
        currentPage: safePage, 
        totalPages, 
        search, 
        sort
    });
});

app.get('/items-page/:id', async (req, res) => {
    const id = Number(req.params.id);
    const item = getById(id);

    if (!item) {
        return res.status(404).send('Recipe not found');
    }

    res.render('item', { item });
});


app.get('/edit/:id', async (req, res) => {
    const item = getById(Number(req.params.id));
    if (!item) return res.status(404).send("Not found");
    res.render('edit', { item });
});

app.get('/delete/:id', async (req, res) => {
    const id = Number(req.params.id);
    deleteById(id);
    res.redirect('/items-page');
});

app.get('/add', async (req, res) => {
    res.render('add');
});

app.post('/items', async (req, res) => {
    const newItem = {
        id: Number(req.body.id),
        name: req.body.name,
        desc: req.body.desc
    };

    create(newItem);
    res.redirect('/items-page');
});

app.put('/items/:id', async (req, res) => {
    const id = Number(req.params.id);
    const updated = updateById(id, req.body);

    if (!updated) {
        return res.status(404).send('Recipe not found');
    }

    res.redirect('/items-page');
});
