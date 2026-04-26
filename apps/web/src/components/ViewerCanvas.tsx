import { useEffect, useRef, useState } from 'react'
import {
  cameras,
  controls,
  drawCommands,
  entitiesFromSolids,
  prepareRender
} from '@jscad/regl-renderer'

type ViewerCanvasProps = {
  geometries: unknown[]
  modelTitle: string
  renderError: string | null
}

type ViewerState = {
  camera: any
  controls: any
  frameId: number
  lastX: number
  lastY: number
  needsRender: boolean
  panDelta: [number, number]
  pointerDown: boolean
  render: (options: any) => void
  renderOptions: any
  rotateDelta: [number, number]
  zoomDelta: number
}

const perspectiveCamera = cameras.perspective
const orbitControls = controls.orbit

const baseEntities = [
  {
    visuals: {
      drawCmd: 'drawGrid',
      show: true
    },
    size: [500, 500],
    ticks: [25, 5]
  },
  {
    visuals: {
      drawCmd: 'drawAxis',
      show: true
    },
    size: 150
  }
]

export const ViewerCanvas = ({ geometries, modelTitle, renderError }: ViewerCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewerRef = useRef<ViewerState | null>(null)
  const [viewerInitError, setViewerInitError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current

    if (!container || !canvas) {
      return
    }

    let resizeObserver: ResizeObserver | null = null
    let handlePointerDown: ((event: PointerEvent) => void) | null = null
    let handlePointerMove: ((event: PointerEvent) => void) | null = null
    let handlePointerUp: ((event: PointerEvent) => void) | null = null
    let handleWheel: ((event: WheelEvent) => void) | null = null

    try {
      setViewerInitError(null)

      const width = container.clientWidth || 960
      const height = container.clientHeight || 640
      canvas.width = width
      canvas.height = height

      const camera = Object.assign({}, perspectiveCamera.defaults)
      perspectiveCamera.setProjection(camera, camera, { width, height })
      perspectiveCamera.update(camera, camera)

      const viewer: ViewerState = {
        camera,
        controls: { ...orbitControls.defaults },
        frameId: 0,
        lastX: 0,
        lastY: 0,
        needsRender: true,
        panDelta: [0, 0],
        pointerDown: false,
        render: prepareRender({ glOptions: { canvas } }),
        renderOptions: {
          camera,
          drawCommands: {
            drawAxis: drawCommands.drawAxis,
            drawGrid: drawCommands.drawGrid,
            drawLines: drawCommands.drawLines,
            drawMesh: drawCommands.drawMesh
          },
          entities: [...baseEntities]
        },
        rotateDelta: [0, 0],
        zoomDelta: 0
      }

      viewerRef.current = viewer

      const doRotatePanZoom = () => {
        if (viewer.rotateDelta[0] || viewer.rotateDelta[1]) {
          const updated = orbitControls.rotate(
            { controls: viewer.controls, camera: viewer.camera, speed: 0.002 },
            viewer.rotateDelta
          )
          viewer.controls = { ...viewer.controls, ...updated.controls }
          viewer.camera = { ...viewer.camera, ...updated.camera }
          viewer.rotateDelta = [0, 0]
          viewer.needsRender = true
        }

        if (viewer.panDelta[0] || viewer.panDelta[1]) {
          const updated = orbitControls.pan(
            { controls: viewer.controls, camera: viewer.camera, speed: 1 },
            viewer.panDelta
          )
          viewer.controls = { ...viewer.controls, ...updated.controls }
          viewer.camera = { ...viewer.camera, ...updated.camera }
          viewer.panDelta = [0, 0]
          viewer.needsRender = true
        }

        if (viewer.zoomDelta) {
          const updated = orbitControls.zoom(
            { controls: viewer.controls, camera: viewer.camera, speed: 0.08 },
            viewer.zoomDelta
          )
          viewer.controls = { ...viewer.controls, ...updated.controls }
          viewer.camera = { ...viewer.camera, ...updated.camera }
          viewer.zoomDelta = 0
          viewer.needsRender = true
        }
      }

      const animate = () => {
        try {
          doRotatePanZoom()

          if (viewer.needsRender) {
            const updated = orbitControls.update({ controls: viewer.controls, camera: viewer.camera })
            viewer.controls = { ...viewer.controls, ...updated.controls }
            viewer.camera = { ...viewer.camera, ...updated.camera }
            viewer.needsRender = Boolean(viewer.controls.changed)
            perspectiveCamera.update(viewer.camera, viewer.camera)
            viewer.renderOptions.camera = viewer.camera
            viewer.render(viewer.renderOptions)
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Rendering failed while drawing the scene.'
          console.error('JSCAD viewer render failure:', error)
          setViewerInitError(message)
          viewer.needsRender = false
        }

        viewer.frameId = window.requestAnimationFrame(animate)
      }

      handlePointerDown = (event: PointerEvent) => {
        viewer.pointerDown = true
        viewer.lastX = event.clientX
        viewer.lastY = event.clientY
        container.setPointerCapture?.(event.pointerId)
      }

      handlePointerMove = (event: PointerEvent) => {
        if (!viewer.pointerDown) {
          return
        }

        const dx = viewer.lastX - event.clientX
        const dy = event.clientY - viewer.lastY
        viewer.lastX = event.clientX
        viewer.lastY = event.clientY

        if (event.shiftKey) {
          viewer.panDelta = [viewer.panDelta[0] + dx, viewer.panDelta[1] + dy]
        } else {
          viewer.rotateDelta = [viewer.rotateDelta[0] + dx, viewer.rotateDelta[1] + dy]
        }

        viewer.needsRender = true
      }

      handlePointerUp = (event: PointerEvent) => {
        viewer.pointerDown = false
        container.releasePointerCapture?.(event.pointerId)
      }

      handleWheel = (event: WheelEvent) => {
        event.preventDefault()
        viewer.zoomDelta += Math.sign(event.deltaY)
        viewer.needsRender = true
      }

      resizeObserver = new ResizeObserver(() => {
        const nextWidth = container.clientWidth || 960
        const nextHeight = container.clientHeight || 640
        canvas.width = nextWidth
        canvas.height = nextHeight
        perspectiveCamera.setProjection(viewer.camera, viewer.camera, {
          width: nextWidth,
          height: nextHeight
        })
        perspectiveCamera.update(viewer.camera, viewer.camera)
        viewer.renderOptions.camera = viewer.camera
        viewer.needsRender = true
      })

      container.addEventListener('pointerdown', handlePointerDown)
      container.addEventListener('pointermove', handlePointerMove)
      container.addEventListener('pointerup', handlePointerUp)
      container.addEventListener('pointerleave', handlePointerUp)
      container.addEventListener('wheel', handleWheel, { passive: false })
      resizeObserver.observe(container)
      viewer.frameId = window.requestAnimationFrame(animate)
    } catch (error) {
      viewerRef.current = null
      const message =
        error instanceof Error ? error.message : 'Unable to initialize the JSCAD viewer.'
      console.error('JSCAD viewer initialization failure:', error)
      setViewerInitError(message)
    }

    return () => {
      const viewer = viewerRef.current

      if (handlePointerDown) {
        container.removeEventListener('pointerdown', handlePointerDown)
      }
      if (handlePointerMove) {
        container.removeEventListener('pointermove', handlePointerMove)
      }
      if (handlePointerUp) {
        container.removeEventListener('pointerup', handlePointerUp)
        container.removeEventListener('pointerleave', handlePointerUp)
      }
      if (handleWheel) {
        container.removeEventListener('wheel', handleWheel)
      }
      resizeObserver?.disconnect()

      if (viewer) {
        window.cancelAnimationFrame(viewer.frameId)
      }

      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current

    if (!viewer) {
      return
    }

    try {
      const solidEntities = geometries.length > 0 ? entitiesFromSolids({}, geometries as any) : []
      viewer.renderOptions.entities = [...baseEntities, ...solidEntities]

      if (solidEntities.length > 0) {
        const updated = orbitControls.zoomToFit({
          controls: viewer.controls,
          camera: viewer.camera,
          entities: solidEntities
        })
        viewer.controls = { ...viewer.controls, ...updated.controls }
        viewer.camera = { ...viewer.camera, ...updated.camera }
        perspectiveCamera.update(viewer.camera, viewer.camera)
        viewer.renderOptions.camera = viewer.camera
      }

      setViewerInitError(null)
      viewer.needsRender = true
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Rendering failed while updating the scene.'
      console.error('JSCAD viewer scene update failure:', error)
      setViewerInitError(message)
    }
  }, [geometries, modelTitle])

  return (
    <div className="viewer-shell">
      <div className="viewer-canvas">
        <canvas ref={canvasRef} className="viewer-surface" aria-label={`${modelTitle} preview`} />
        <div ref={containerRef} className="viewer-hitbox" />
      </div>
      <div className="viewer-hud">
        <span>Drag to orbit</span>
        <span>Shift + drag to pan</span>
        <span>Wheel to zoom</span>
      </div>
      {renderError || viewerInitError ? (
        <div className="viewer-overlay">{renderError ?? viewerInitError ?? 'Preview unavailable'}</div>
      ) : null}
    </div>
  )
}
