import os

gallery_dir = r"d:\desarrollos\ABDSynths\ABDSynthsWeb\abd-ia_synths\public\images\gallery\abd-junio-supersix"
for filename in os.listdir(gallery_dir):
    if " " in filename:
        new_filename = filename.replace(" ", "_")
        src = os.path.join(gallery_dir, filename)
        dst = os.path.join(gallery_dir, new_filename)
        os.rename(src, dst)
        print(f"Renamed: {filename} -> {new_filename}")
