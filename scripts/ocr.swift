import Foundation
import Vision
import AppKit

for address in CommandLine.arguments.dropFirst() {
    guard let url = URL(string: address), let data = try? Data(contentsOf: url),
          let image = NSImage(data: data),
          let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("IMAGE UNAVAILABLE: \(address)"); continue
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["vi-VN", "en-US"]
    request.usesLanguageCorrection = true
    do {
        try VNImageRequestHandler(cgImage: cg).perform([request])
        print("IMAGE: \(address) (\(cg.width)x\(cg.height))")
        for observation in (request.results ?? []).sorted(by: {
            abs($0.boundingBox.midY - $1.boundingBox.midY) > 0.009
                ? $0.boundingBox.midY > $1.boundingBox.midY
                : $0.boundingBox.minX < $1.boundingBox.minX
        }) {
            guard let candidate = observation.topCandidates(1).first else { continue }
            print(String(format: "y=%.3f x=%.3f %@", observation.boundingBox.midY,
                         observation.boundingBox.minX, candidate.string))
        }
    } catch { print("OCR FAILED: \(address) \(error)") }
}
