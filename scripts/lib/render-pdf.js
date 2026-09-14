// PDF / Illustrator(.ai) の各ページを PNG に書き出す。
//
//   osascript -l JavaScript scripts/lib/render-pdf.js <src> <outDir> <長辺px> [prefix]
//
// .ai は中身が PDF なので PDFKit でそのまま開ける。Illustrator は不要。
// macOS 標準の機能だけで完結させたいので JXA を使っている（Node からは child_process で呼ぶ）。

ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('Quartz');

var args = $.NSProcessInfo.processInfo.arguments;
var src = ObjC.unwrap(args.objectAtIndex(4));
var outDir = ObjC.unwrap(args.objectAtIndex(5));
var target = parseFloat(ObjC.unwrap(args.objectAtIndex(6)));
var prefix = args.count > 7 ? ObjC.unwrap(args.objectAtIndex(7)) : 'page';

var doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(src));
if (!doc.js) {
  console.log('ERROR: PDF として開けません: ' + src);
} else {
  for (var i = 0; i < doc.pageCount; i++) {
    var page = doc.pageAtIndex(i);
    var b = page.boundsForBox($.kPDFDisplayBoxMediaBox);
    var scale = target / Math.max(b.size.width, b.size.height);
    var size = {
      width: Math.round(b.size.width * scale),
      height: Math.round(b.size.height * scale),
    };

    var thumb = page.thumbnailOfSizeForBox(size, $.kPDFDisplayBoxMediaBox);
    var rep = $.NSBitmapImageRep.imageRepWithData(thumb.TIFFRepresentation);
    var png = rep.representationUsingTypeProperties(
      $.NSBitmapImageFileTypePNG,
      $.NSDictionary.dictionary,
    );
    var out = outDir + '/' + prefix + '-' + (i + 1) + '.png';
    png.writeToFileAtomically($(out), true);
    console.log(out + ' ' + size.width + 'x' + size.height);
  }
}
