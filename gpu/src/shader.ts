export default
    `
    [[block]] struct Data {
      value: array<f32>;
    };

    [[group(0), binding(0)]] var<storage, read> firstMatrix : Data;
    // [[group(0), binding(1)]] var<storage, read> secondMatrix : Data;
    [[group(0), binding(1)]] var<storage, write> resultMatrix : Data;
          
          [[stage(compute)]] fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
            // resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);
            
            // let resultCell : vec2<u32> = vec2<u32>(global_id.x, global_id.y);
            // var result : f32 = 0.0;
            // for (var i : u32 = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
            //   let a : u32 = i + resultCell.x * u32(firstMatrix.size.y);
            //   let b : u32 = resultCell.y + i * u32(secondMatrix.size.y);
            //   result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
            // }
            
            // let index : u32 = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
            
            // resultMatrix.value[0] = firstMatrix.value[0];
            // resultMatrix.value[global_id.x] = f32(global_id);
            // resultMatrix.value[global_id.x] = f32(global_id.x);
            // resultMatrix.value[global_id.x] = f32(global_id.x);
            resultMatrix.value[global_id.x] = firstMatrix.value[global_id.x] * f32(2);
          }
`

