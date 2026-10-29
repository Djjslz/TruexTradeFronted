import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { crearItem } from '../services/api'
import { procesarImagen } from '../utils/images'

const MAX_IMAGENES = 4
const CATEGORIAS = ['Deportes', 'Música', 'Hogar', 'Libros', 'Tecnología', 'Moda', 'Otros']
const ESTADOS = ['Nuevo', 'Excelente estado', 'Buen estado', 'Con detalles']
const TIPOS = [
  { valor: 'trueque', etiqueta: 'Solo trueque' },
  { valor: 'venta', etiqueta: 'Solo venta' },
  { valor: 'ambos', etiqueta: 'Trueque o venta' },
]

function Publicar() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('trueque')
  const [precio, setPrecio] = useState('')
  const [ubicacion, setUbicacion] = useState(user?.ubicacion ?? '')
  const [imagenes, setImagenes] = useState([])
  const [arrastrando, setArrastrando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorImagenes, setErrorImagenes] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const limpiarError = (campo) => {
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales
      const nuevos = { ...actuales }
      delete nuevos[campo]
      return nuevos
    })
    setErrorGeneral('')
  }

  const agregarArchivos = async (archivos) => {
    const lista = Array.from(archivos ?? [])
    if (lista.length === 0) return

    setErrorImagenes('')

    const disponibles = MAX_IMAGENES - imagenes.length
    if (disponibles <= 0) {
      setErrorImagenes(`Puedes subir hasta ${MAX_IMAGENES} imágenes.`)
      return
    }

    setProcesando(true)

    const procesadas = []
    let mensaje = ''

    for (const archivo of lista.slice(0, disponibles)) {
      try {
        procesadas.push(await procesarImagen(archivo))
      } catch (error) {
        mensaje = error.message
      }
    }

    if (procesadas.length > 0) {
      setImagenes((actuales) => [...actuales, ...procesadas])
    }

    setErrorImagenes(mensaje)
    setProcesando(false)
  }

  const handleArchivos = (evento) => {
    agregarArchivos(evento.target.files)
    evento.target.value = ''
  }

  const handleDrop = (evento) => {
    evento.preventDefault()
    setArrastrando(false)
    agregarArchivos(evento.dataTransfer.files)
  }

  const quitarImagen = (indice) => {
    setImagenes((actuales) => actuales.filter((imagen, posicion) => posicion !== indice))
  }

  const validar = () => {
    const nuevos = {}
    const tituloLimpio = titulo.trim()
    const descripcionLimpia = descripcion.trim()

    if (tituloLimpio.length < 3 || tituloLimpio.length > 80) {
      nuevos.titulo = 'El título debe tener entre 3 y 80 caracteres.'
    }
    if (!categoria) nuevos.categoria = 'Selecciona una categoría.'
    if (descripcionLimpia.length < 10 || descripcionLimpia.length > 600) {
      nuevos.descripcion = 'La descripción debe tener entre 10 y 600 caracteres.'
    }
    if (!estado) nuevos.estado = 'Selecciona el estado del artículo.'
    if (tipo !== 'trueque' && !(Number(precio) > 0)) {
      nuevos.precio = 'Indica un precio mayor que cero.'
    }
    if (ubicacion.trim().length < 2) {
      nuevos.ubicacion = 'Indica tu ciudad o región.'
    }

    return nuevos
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    setErrorGeneral('')

    try {
      const item = await crearItem(
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          categoria,
          estado,
          tipo,
          precio: tipo === 'trueque' ? null : Number(precio),
          ubicacion: ubicacion.trim(),
          imagenes,
          usuario: {
            id: user.id,
            nombre: user.nombre,
            avatar: user.avatar ?? '',
          },
        },
        token,
      )

      navigate(`/producto/${item.id}`)
    } catch (error) {
      setErrorGeneral(error.message)
    } finally {
      setEnviando(false)
    }
  }

  const limiteAlcanzado = imagenes.length >= MAX_IMAGENES

  return (
    <div className="container page">
      <h1>Publicar un artículo</h1>
      <p className="muted">Completa los datos de lo que quieres intercambiar.</p>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {errorGeneral && (
          <p className="form-alert" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="field">
          <label className="field-label" htmlFor="publicar-titulo">
            Título
          </label>
          <input
            id="publicar-titulo"
            type="text"
            className={`input ${errores.titulo ? 'input-error' : ''}`.trim()}
            placeholder="Ej. Bicicleta rodado 29"
            value={titulo}
            maxLength="80"
            onChange={(evento) => {
              setTitulo(evento.target.value)
              limpiarError('titulo')
            }}
            aria-invalid={Boolean(errores.titulo)}
          />
          {errores.titulo && <span className="field-error">{errores.titulo}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="publicar-categoria">
            Categoría
          </label>
          <select
            id="publicar-categoria"
            className={`input ${errores.categoria ? 'input-error' : ''}`.trim()}
            value={categoria}
            onChange={(evento) => {
              setCategoria(evento.target.value)
              limpiarError('categoria')
            }}
            aria-invalid={Boolean(errores.categoria)}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {CATEGORIAS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
          {errores.categoria && <span className="field-error">{errores.categoria}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="publicar-descripcion">
            Descripción
          </label>
          <textarea
            id="publicar-descripcion"
            className={`input ${errores.descripcion ? 'input-error' : ''}`.trim()}
            rows="5"
            maxLength="600"
            placeholder="Describe el estado y qué te gustaría recibir a cambio"
            value={descripcion}
            onChange={(evento) => {
              setDescripcion(evento.target.value)
              limpiarError('descripcion')
            }}
            aria-invalid={Boolean(errores.descripcion)}
          />
          {errores.descripcion && (
            <span className="field-error">{errores.descripcion}</span>
          )}
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label" htmlFor="publicar-estado">
              Estado
            </label>
            <select
              id="publicar-estado"
              className={`input ${errores.estado ? 'input-error' : ''}`.trim()}
              value={estado}
              onChange={(evento) => {
                setEstado(evento.target.value)
                limpiarError('estado')
              }}
              aria-invalid={Boolean(errores.estado)}
            >
              <option value="" disabled>
                Selecciona el estado
              </option>
              {ESTADOS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            {errores.estado && <span className="field-error">{errores.estado}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="publicar-tipo">
              Modalidad
            </label>
            <select
              id="publicar-tipo"
              className="input"
              value={tipo}
              onChange={(evento) => {
                setTipo(evento.target.value)
                limpiarError('precio')
              }}
            >
              {TIPOS.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tipo !== 'trueque' && (
          <div className="field">
            <label className="field-label" htmlFor="publicar-precio">
              Precio (COP)
            </label>
            <input
              id="publicar-precio"
              type="number"
              min="0"
              step="1000"
              className={`input ${errores.precio ? 'input-error' : ''}`.trim()}
              placeholder="Ej. 150000"
              value={precio}
              onChange={(evento) => {
                setPrecio(evento.target.value)
                limpiarError('precio')
              }}
              aria-invalid={Boolean(errores.precio)}
            />
            {errores.precio && <span className="field-error">{errores.precio}</span>}
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor="publicar-ubicacion">
            Ubicación
          </label>
          <input
            id="publicar-ubicacion"
            type="text"
            className={`input ${errores.ubicacion ? 'input-error' : ''}`.trim()}
            placeholder="Ciudad, departamento"
            value={ubicacion}
            onChange={(evento) => {
              setUbicacion(evento.target.value)
              limpiarError('ubicacion')
            }}
            aria-invalid={Boolean(errores.ubicacion)}
          />
          {errores.ubicacion && <span className="field-error">{errores.ubicacion}</span>}
        </div>

        <div className="field">
          <span className="field-label">Imágenes</span>
          <label
            className={`upload-drop ${arrastrando ? 'is-dragging' : ''} ${
              limiteAlcanzado ? 'is-disabled' : ''
            }`.trim()}
            onDragOver={(evento) => {
              evento.preventDefault()
              if (!limiteAlcanzado) setArrastrando(true)
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="upload-input"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleArchivos}
              disabled={enviando || procesando || limiteAlcanzado}
            />
            <strong>
              {procesando
                ? 'Procesando imágenes…'
                : limiteAlcanzado
                  ? 'Límite de imágenes alcanzado'
                  : 'Haz clic o arrastra tus fotos aquí'}
            </strong>
            <span>Hasta {MAX_IMAGENES} imágenes · JPG, PNG, WEBP o GIF · máx. 5 MB</span>
          </label>
          {errorImagenes && <span className="field-error">{errorImagenes}</span>}

          {imagenes.length > 0 && (
            <div className="upload-grid">
              {imagenes.map((imagen, indice) => (
                <div className="upload-item" key={`${indice}-${imagen.slice(-24)}`}>
                  <img src={imagen} alt={`Imagen ${indice + 1}`} />
                  <button
                    type="button"
                    className="upload-remove"
                    onClick={() => quitarImagen(indice)}
                    aria-label={`Quitar imagen ${indice + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={enviando || procesando}>
          {enviando ? 'Publicando…' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}

export default Publicar
