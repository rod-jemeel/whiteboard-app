'use client'

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export function ShaderGradientBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <ShaderGradientCanvas
        style={{
          width: '100%',
          height: '100%',
        }}
        fov={100}
        pixelDensity={1}
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          type="waterPlane"
          wireframe={false}
          shader="defaults"
          uTime={8}
          uSpeed={0.3}
          uStrength={1.5}
          uDensity={1.5}
          uFrequency={0}
          uAmplitude={0}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          color1="#242880"
          color2="#8d7dca"
          color3="#212121"
          reflection={0.1}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={2.8}
          cameraZoom={9.1}
          lightType="3d"
          brightness={1}
          envPreset="city"
          grain="on"
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  )
}