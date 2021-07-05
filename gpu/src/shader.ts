export default
    `
    
    [[block]] struct Params {
      lapin : f32;
      chien : f32;
    };

    struct Line {
      time : u32;
      open : f32;
      high : f32;
      low : f32;
      close : f32;
      volume : f32;
    };

    [[block]] struct Data {
      value: array<Line>;
    };

    [[block]] struct Result {
      value: array<f32>;
    };

    [[group(0), binding(0)]] var<storage, read> data : Data;
    [[group(0), binding(1)]] var<storage, write> result : Result;
    [[group(0), binding(2)]] var<uniform> params : Params;
          
    [[stage(compute), workgroup_size(32,32)]] fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
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
      
      // result[0] = data.value[global_id.x] * f32(2);
      // result.value[0] = data.value[1];

      // result.value[0] = global_id.x;
      
      for(var i: i32 = 0; i < 20000; i = i + 1) {
        if (data.value[i].open > f32(40000)){
          result.value[global_id.x] = f32(12);
        }
      }


      // for(var i: i32 = 0; i < 10000; i = i + 1) {
      //   if (data.value[i] > f32(35233)){
      //     // result.value[0] = data.value[global_id.x];
      //     result.value[global_id.x] = f32(65);
      //   }
      // }
    }
`