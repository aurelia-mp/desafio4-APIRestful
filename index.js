const express = require('express')
const {Router} = express
const multer = require('multer')
const Contenedor = require("./class.js")
const productos = new Contenedor('./productos.txt')

const app = express()

const router = new Router()

// Middleware
router.use(express.json())
router.use(express.urlencoded({extended: true}))

app.use(express.static('public'))
app.use('/api/productos', router)

// Configuración de Multer
const storage=multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, './upload')
    },
    filename: (req, file, cb) =>{
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.originalname}`)
    }
})

const upload = multer({storage: storage})




// GET

router.get('', (req,res) =>{
    productos.getAll()
    .then(resp=>{
        res.send(resp)
    })
    .catch(err=>{
        res.send(err)
    })
})

router.get('/:id', (req,res)=>{
    let id = parseInt(req.params.id)
    productos.getById(id)
    .then(resp => 
        resp ? 
            res.send(resp)
            :
            res.send({error: 'producto no encontrado'}) 
        )
})

// DELETE
router.delete('/:id', (req, res) =>{
    let id=parseInt(req.params.id)
    productos.deleteById(id)
    .then(resp=>
            resp ?
                (res.send(`Producto ${id} borrado`))
                :
                res.send({error: 'producto no encontrado'}) 
        )
})

// POST

router.post('', upload.single('file'), (req, res, next) =>{
    const file = req.file
    
    if(!file) {
        const error = new Error('Error subiendo el archivo')
        error.httpStatusCode = 400
        return next(error)
    }
    
    let producto = {
        title: req.body.nombre,
        price: req.body.precio,
        thumbnail: `/upload/${file.originalname}`
    }
    
    productos.save(producto)

    .then(resp =>{
        console.log('Producto guardado')
        productos.getById(resp)
        .then(resp =>{
            res.json({
                "Producto guardado":resp})
        })
    })
})

// PUT 
router.put('/:id', (req,res) =>{
    let id = parseInt(req.params.id)
    let prodActualizado = {
        title : req.body.title,
        price: req.body.price,
        thumbnail: req.body.thumbnail
    }  
    productos.udpateById(id, prodActualizado)
    .then(resp=>{
        res.send(`Producto ${id} actualizado`)
    })
})

const PORT = 8090
app.listen(PORT, () =>{
    console.log('servidor ok')
})