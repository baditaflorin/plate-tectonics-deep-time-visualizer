(module
  (import "env" "sin" (func $sin (param f64) (result f64)))
  (import "env" "cos" (func $cos (param f64) (result f64)))
  (import "env" "abs" (func $abs (param f64) (result f64)))

  (func $normalize_lon (param $lon f64) (result f64)
    (local $x f64)
    local.get $lon
    local.set $x
    local.get $x
    f64.const 180
    f64.gt
    if
      local.get $x
      f64.const 360
      f64.sub
      local.set $x
    end
    local.get $x
    f64.const -180
    f64.lt
    if
      local.get $x
      f64.const 360
      f64.add
      local.set $x
    end
    local.get $x
  )

  (func $reconstruct_lon
    (param $lon f64)
    (param $lat f64)
    (param $center_lon f64)
    (param $center_lat f64)
    (param $age_ma f64)
    (param $lon_offset f64)
    (param $lat_offset f64)
    (param $rotation_deg f64)
    (result f64)
    local.get $lon
    local.get $lon_offset
    f64.add
    local.get $lat
    local.get $center_lat
    f64.sub
    local.get $age_ma
    f64.const 0.8
    f64.mul
    f64.add
    f64.const 0.017453292519943295
    f64.mul
    call $sin
    local.get $rotation_deg
    f64.mul
    f64.const 0.18
    f64.mul
    f64.add
    call $normalize_lon
  )

  (func $reconstruct_lat
    (param $lon f64)
    (param $lat f64)
    (param $center_lon f64)
    (param $center_lat f64)
    (param $age_ma f64)
    (param $lon_offset f64)
    (param $lat_offset f64)
    (param $rotation_deg f64)
    (result f64)
    (local $next f64)
    local.get $lat
    local.get $lat_offset
    f64.add
    local.get $lon
    local.get $center_lon
    f64.sub
    local.get $age_ma
    f64.const 0.5
    f64.mul
    f64.sub
    f64.const 0.017453292519943295
    f64.mul
    call $cos
    local.get $rotation_deg
    f64.mul
    f64.const 0.12
    f64.mul
    f64.add
    local.set $next
    local.get $next
    f64.const 82
    f64.gt
    if (result f64)
      f64.const 82
    else
      local.get $next
      f64.const -82
      f64.lt
      if (result f64)
        f64.const -82
      else
        local.get $next
      end
    end
  )

  (func $uplift_signal
    (param $age_ma f64)
    (param $start_ma f64)
    (param $end_ma f64)
    (param $intensity f64)
    (result f64)
    (local $mid f64)
    (local $half f64)
    local.get $age_ma
    local.get $start_ma
    f64.gt
    local.get $age_ma
    local.get $end_ma
    f64.lt
    i32.or
    local.get $start_ma
    local.get $end_ma
    f64.le
    i32.or
    if (result f64)
      f64.const 0
    else
      local.get $start_ma
      local.get $end_ma
      f64.add
      f64.const 2
      f64.div
      local.set $mid
      local.get $start_ma
      local.get $end_ma
      f64.sub
      f64.const 2
      f64.div
      local.set $half
      local.get $intensity
      f64.const 1
      local.get $age_ma
      local.get $mid
      f64.sub
      call $abs
      local.get $half
      f64.div
      f64.sub
      f64.mul
    end
  )

  (export "reconstruct_lon" (func $reconstruct_lon))
  (export "reconstruct_lat" (func $reconstruct_lat))
  (export "uplift_signal" (func $uplift_signal))
)
