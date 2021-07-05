import React from 'react';
import { useEffect } from "react"
import code from './shader';
import './App.css';

class Trade {
  data!: ArrayBuffer;

  constructor() {

  }

  async loadData() {
    const res = await fetch("./data")
    this.data = await res.arrayBuffer()
  }
}

declare var navigator: any;
declare var GPUBufferUsage: any;
declare var GPUMapMode: any;
declare var GPUShaderStage: any;
// declare var GPUMapMode: any;
// declare var GPUMapMode: any;

function App() {
  useEffect(() => {
    (async () => {
      const trade = new Trade();
      await trade.loadData()
      console.log(trade.data);

      return;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.log("Failed to get GPU adapter.");
        return;
      }
      const device = await adapter.requestDevice();

      // First Matrix

      const firstMatrix = new Float32Array([
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19
      ]);

      const gpuBufferFirstMatrix = device.createBuffer({
        mappedAtCreation: true,
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE
      });
      const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
      new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
      gpuBufferFirstMatrix.unmap();

      // Second Matrix

      // const secondMatrix = new Float32Array([
      //   1,
      //   1,
      //   1,
      //   1,
      //   1,
      //   1,
      //   1,
      //   1,
      //   1,
      //   1
      // ]);

      // const gpuBufferSecondMatrix = device.createBuffer({
      //   mappedAtCreation: true,
      //   size: secondMatrix.byteLength,
      //   usage: GPUBufferUsage.STORAGE
      // });
      // const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
      // new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
      // gpuBufferSecondMatrix.unmap();

      // Result Matrix
      // const resultMatrixBufferSize =
      //   Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
      const resultMatrixBuffer = device.createBuffer({
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      });

      // Bind group layout and bind group

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: "read-only-storage"
            }
          },
          // {
          //   binding: 1,
          //   visibility: GPUShaderStage.COMPUTE,
          //   buffer: {
          //     type: "read-only-storage"
          //   }
          // },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: "storage"
            }
          }
        ]
      });

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: {
              buffer: gpuBufferFirstMatrix
            }
          },
          // {
          //   binding: 1,
          //   resource: {
          //     buffer: gpuBufferSecondMatrix
          //   }
          // },
          {
            binding: 1,
            resource: {
              buffer: resultMatrixBuffer
            }
          }
        ]
      });

      // Compute shader code

      const shaderModule = device.createShaderModule({
        code
      });

      // Pipeline setup

      const computePipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout]
        }),
        compute: {
          module: shaderModule,
          entryPoint: "main"
        }
      });

      // Commands submission

      const commandEncoder = device.createCommandEncoder();

      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(computePipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatch(firstMatrix.byteLength /* x */, 1/*y*/);
      passEncoder.endPass();

      // Get a GPU buffer for reading in an unmapped state.
      const gpuReadBuffer = device.createBuffer({
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });

      // Encode commands for copying buffer to buffer.
      commandEncoder.copyBufferToBuffer(
        resultMatrixBuffer /* source buffer */,
        0 /* source offset */,
        gpuReadBuffer /* destination buffer */,
        0 /* destination offset */,
        firstMatrix.byteLength, /* size */
      );

      // Submit GPU commands.
      const gpuCommands = commandEncoder.finish();
      device.queue.submit([gpuCommands]);

      // Read buffer.
      await gpuReadBuffer.mapAsync(GPUMapMode.READ);
      const arrayBuffer = gpuReadBuffer.getMappedRange();
      console.log(new Float32Array(arrayBuffer));
    })()

  }, [])
  return (
    <div>
      chien
    </div>
  );
}

export default App;
