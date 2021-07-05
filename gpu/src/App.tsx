import React from 'react';
import { useEffect } from "react"
import code from './shader';
import './App.css';

class GPUComputer {
  data!: ArrayBuffer;

  device!: GPUDevice;

  computePipeline!: GPUComputePipeline;

  gpuParamsBuffer!: GPUBuffer
  gpuResBuffer!: GPUBuffer;

  bindGroup!: any;

  constructor() {

  }

  async loadData() {
    const res = await fetch("./data")
    this.data = await res.arrayBuffer()
    console.log("Data loaded");
  }

  async initGpu() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.log("Failed to get GPU adapter.");
      return;
    }
    this.device = await adapter.requestDevice();
    // upload data to gpu
    const gpuDataBuffer = this.device.createBuffer({
      mappedAtCreation: true,
      size: this.data.byteLength,
      usage: GPUBufferUsage.STORAGE
    });
    const gpuData = gpuDataBuffer.getMappedRange();
    new Float32Array(gpuData).set(new Float32Array(this.data));
    gpuDataBuffer.unmap();

    // Result buffer
    this.gpuResBuffer = this.device.createBuffer({
      size: 512 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    // Uniform buffer
    this.gpuParamsBuffer = this.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "read-only-storage" as GPUBufferBindingType
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage" as GPUBufferBindingType
          }
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "uniform" as GPUBufferBindingType
          }
        }
      ]
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: gpuDataBuffer
          }
        },
        {
          binding: 1,
          resource: {
            buffer: this.gpuResBuffer
          }
        },
        {
          binding: 2,
          resource: {
            buffer: this.gpuParamsBuffer
          }
        }
      ]
    });

    const shaderModule = this.device.createShaderModule({
      code
    });

    this.computePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
      }),
      compute: {
        module: shaderModule,
        entryPoint: "main"
      }
    });

  }

  async bake(params: number[]) {
    const resLength = 512 * 4;
    const time = performance.now();
    this.device.queue.writeBuffer(this.gpuParamsBuffer, 0, new Float32Array(params))
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.computePipeline);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.dispatch(32 /* x */, 32 /*y*/);
    passEncoder.endPass();

    // Get a GPU buffer for reading in an unmapped state.
    const gpuReadBuffer = this.device.createBuffer({
      size: resLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    // Encode commands for copying buffer to buffer.
    commandEncoder.copyBufferToBuffer(
      this.gpuResBuffer /* source buffer */,
      0 /* source offset */,
      gpuReadBuffer /* destination buffer */,
      0 /* destination offset */,
      resLength, /* size */
    );

    // Submit GPU commands.
    const gpuCommands = commandEncoder.finish();
    this.device.queue.submit([gpuCommands]);

    // Read buffer.
    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = gpuReadBuffer.getMappedRange();
    console.log(new Float32Array(arrayBuffer));
    console.log(performance.now() - time);
    gpuReadBuffer.destroy()
  }
}

function App() {
  useEffect(() => {
    (async () => {
      const trade = new GPUComputer();
      await trade.loadData();
      await trade.initGpu();
      for (let i = 0; i < 10000000; i++) {
        await trade.bake([58 + i]);
      }
      // await trade.bake([22]);
    })()

  }, [])
  return (
    <div>
      chien
    </div>
  );
}

export default App;

// 2329881 lines