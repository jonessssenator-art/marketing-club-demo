import sys,zipfile,xml.etree.ElementTree as E
from pathlib import Path
p=Path(sys.argv[1]); ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
with zipfile.ZipFile(p) as z: items={n:z.read(n) for n in z.namelist()}
core=E.fromstring(items['docProps/core.xml'])
for tag,v in [('{http://purl.org/dc/elements/1.1/}creator','xxvii'),('{http://purl.org/dc/elements/1.1/}title','Marketing Club'),('{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}lastModifiedBy','xxvii')]:
 el=core.find(tag)
 if el is not None: el.text=v
items['docProps/core.xml']=E.tostring(core,encoding='utf-8',xml_declaration=True)
for i in range(1,16):
 name=f'ppt/slides/slide{i}.xml'; doc=E.fromstring(items[name]); relname=f'ppt/slides/_rels/slide{i}.xml.rels'; rel=E.fromstring(items[relname]); rid='rIdAuthorTelegram'
 E.SubElement(rel,'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship',{'Id':rid,'Type':ns['r']+'/hyperlink','Target':'https://t.me/xxvii','TargetMode':'External'})
 for sp in doc.findall('.//p:sp',ns):
  if ''.join(t.text or '' for t in sp.findall('.//a:t',ns))in ('подготовлено xxvii','xxvii','t.me/xxvii'):
   pr=sp.find('p:nvSpPr/p:cNvPr',ns)
   E.SubElement(pr,'{'+ns['a']+'}hlinkClick',{'{'+ns['r']+'}id':rid})
 items[name]=E.tostring(doc,encoding='utf-8',xml_declaration=True);items[relname]=E.tostring(rel,encoding='utf-8',xml_declaration=True)
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in items.items():z.writestr(name,data)
