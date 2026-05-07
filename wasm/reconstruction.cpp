// A deliberately small GPlates-inspired reconstruction kernel for v1.
// The production bundle ships an equivalent WebAssembly module built from
// wasm/reconstruction.wat so GitHub Pages can run without an Emscripten toolchain.
#include <cmath>

extern "C" {

double normalize_lon(double lon) {
  if (lon > 180.0) {
    return lon - 360.0;
  }
  if (lon < -180.0) {
    return lon + 360.0;
  }
  return lon;
}

double reconstruct_lon(double lon, double lat, double center_lon, double center_lat,
                       double age_ma, double lon_offset, double lat_offset,
                       double rotation_deg) {
  (void)lat_offset;
  const double phase = (lat - center_lat + age_ma * 0.8) * 0.017453292519943295;
  return normalize_lon(lon + lon_offset + std::sin(phase) * rotation_deg * 0.18);
}

double reconstruct_lat(double lon, double lat, double center_lon, double center_lat,
                       double age_ma, double lon_offset, double lat_offset,
                       double rotation_deg) {
  (void)lon_offset;
  const double phase = (lon - center_lon - age_ma * 0.5) * 0.017453292519943295;
  double next_lat = lat + lat_offset + std::cos(phase) * rotation_deg * 0.12;
  if (next_lat > 82.0) {
    return 82.0;
  }
  if (next_lat < -82.0) {
    return -82.0;
  }
  return next_lat;
}

double uplift_signal(double age_ma, double start_ma, double end_ma, double intensity) {
  if (age_ma > start_ma || age_ma < end_ma || start_ma <= end_ma) {
    return 0.0;
  }

  const double midpoint = (start_ma + end_ma) / 2.0;
  const double half_span = (start_ma - end_ma) / 2.0;
  const double normalized = std::fabs(age_ma - midpoint) / half_span;
  return intensity * (1.0 - normalized);
}

}
