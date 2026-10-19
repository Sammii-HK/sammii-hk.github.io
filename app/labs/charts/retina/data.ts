/**
 * Photoreceptor density along the horizontal meridian of the human retina,
 * from Curcio, Sloan, Kalina and Hendrickson (1990), Human photoreceptor
 * topography, J Comp Neurol 292:497. These are the authors' own numbers:
 * the spreadsheet behind Figures 6 and 9 of the paper (4meridians.xls,
 * published by Christine Curcio at christineacurcio.com/PRtopo), which
 * averages the eyes they counted. Degrees are the authors' conversion from
 * millimetres with the Drasdo and Fowler (1974) schematic eye, 275 µm per
 * degree near the centre and non-linear towards the edge.
 *
 * Rows are [mm from the foveal centre, degrees, cones/mm², rods/mm²]; null
 * where the composite has no value. On the nasal side the gap at 3.98 mm is
 * the optic disc, where there are no photoreceptors to count.
 */
export type Row = [number, number, number | null, number | null];

export const TEMPORAL: Row[] = [
  [0.0, 0.0, 196890, 0], [0.05, 0.18, 162414, 13], [0.1, 0.36, 121619, 74], [0.149, 0.54, 98424, 1022], [0.199, 0.71, 80004, 3864], [0.298, 1.07, 57712, 13439], [0.398, 1.43, 45420, 26877], [0.497, 1.79, 38380, 36675], [0.597, 2.14, 34223, 45316], [0.697, 2.5, 29027, 53390], [0.796, 2.86, 24144, 60097], [0.896, 3.21, 21165, 64875], [0.995, 3.57, 19699, 68997], [1.99, 7.14, 11703, 109264], [2.985, 10.71, 9118, 132354], [3.98, 14.29, 7030, 138390], [4.975, 17.86, 5786, 137095], [5.97, 21.43, 5103, 134004], [6.965, 25.0, 4780, 126964], [7.96, 28.57, 4477, 120700], [8.955, 32.14, 4208, 112405], [9.95, 35.71, 3888, 105756], [10.945, 39.28, 3763, 98807], [11.94, 42.85, 3539, 90966], [12.935, 46.64, 3436, 83973], [13.93, 50.79, 3368, 76106], [14.925, 54.9, 3336, 69000], [15.92, 58.77, 3176, 60889], [16.915, 62.91, 3070, null], [17.91, 67.67, 3359, null],
];

export const NASAL: Row[] = [
  [0.0, 0.0, 196890, 0], [0.05, 0.18, 154441, 0], [0.1, 0.36, 115399, 24], [0.149, 0.54, 92992, 204], [0.199, 0.71, 74233, 969], [0.298, 1.07, 53432, 11023], [0.398, 1.43, 42975, 22395], [0.497, 1.79, 36493, 33699], [0.597, 2.14, 31530, 43492], [0.697, 2.5, 26109, 50971], [0.796, 2.86, 23872, 57762], [0.896, 3.21, 22339, 62923], [0.995, 3.57, 20962, 66977], [1.99, 7.14, 12522, 111888], [2.985, 10.71, 8849, 130967], [3.98, 14.29, null, null], [4.975, 17.86, 7179, 126595], [5.97, 21.43, 6651, 145158], [6.965, 25.0, 6409, 144241], [7.96, 28.57, 6232, 137114], [8.955, 32.14, 5959, 130478], [9.95, 35.71, 5609, 123706], [10.945, 39.28, 5348, 116888], [11.94, 42.85, 5139, 109731], [12.935, 46.64, 4989, 102422], [13.93, 50.79, 4886, 93008], [14.925, 54.9, 4807, 83995], [15.92, 58.77, 4726, 78266], [16.915, 62.91, 4721, 71644], [17.91, 67.67, 4717, 59557], [18.905, 72.69, 4846, 56824], [19.9, 77.97, 5234, 48666], [20.895, 84.38, 4906, null], [21.89, 91.35, 5191, null],
];

/**
 * The optic disc, drawn where the composite has its gap (3.98 mm nasal, 14.3°
 * by the authors' conversion) at its average size: 1.76 mm across and 1.92 mm
 * tall (Jonas, Gusek and Naumann 1988, 457 eyes), about 6.4° by 7° at 275 µm
 * per degree.
 */
export const DISC = { centreMm: 3.98, centreDeg: 14.29, widthMm: 1.76, heightMm: 1.92, widthDeg: 1.76 / 0.275, heightDeg: 1.92 / 0.275 };

/**
 * The blind spot, as measured in the visual field: its centre 15.5° ± 1.1°
 * from fixation horizontally and 1.5° below it (Rohrschneider 2004, 104
 * eyes). The demo uses this.
 */
export const BLIND_SPOT = { centreDeg: 15.5, sdDeg: 1.1, belowDeg: 1.5 };

/** Totals and the fovea, from the abstract of Curcio et al. (1990). */
export const TOTALS = {
  cones: 4_600_000,
  conesRange: "4.08 to 5.29 million",
  rods: 92_000_000,
  rodsRange: "77.9 to 107.3 million",
  peakCones: 199_000,
  peakConesRange: "100,000 to 324,000",
  rodFreeMm: 0.35,
  rodFreeDeg: 1.25,
};
