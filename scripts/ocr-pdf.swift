import Foundation
import PDFKit
import Vision
import AppKit

guard let address=CommandLine.arguments.dropFirst().first,
      let url=URL(string:address),let data=try? Data(contentsOf:url),
      let pdf=PDFDocument(data:data) else { fatalError("PDF unavailable") }
print("PDF PAGES: \(pdf.pageCount)")
for i in 0..<pdf.pageCount {
    guard let page=pdf.page(at:i) else {continue}
    let image=page.thumbnail(of:NSSize(width:1600,height:2200),for:.mediaBox)
    guard let cg=image.cgImage(forProposedRect:nil,context:nil,hints:nil) else {continue}
    let req=VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages=["vi-VN","en-US"]
    try? VNImageRequestHandler(cgImage:cg).perform([req])
    let text=(req.results ?? []).sorted(by:{$0.boundingBox.midY > $1.boundingBox.midY}).compactMap{$0.topCandidates(1).first?.string}.joined(separator:"\n")
    if text.localizedCaseInsensitiveContains("học phí") || text.localizedCaseInsensitiveContains("điểm chuẩn") {
        print("PAGE \(i+1): \(text.prefix(8500))")
    }
}
