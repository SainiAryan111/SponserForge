import os
import zipfile

project_root = r"d:\Project\SponserForge"
output_zip = os.path.join(project_root, "SponsorForge_Project.zip")

exclude_dirs = {
    os.path.normpath(r"d:\Project\SponserForge\.git"),
    os.path.normpath(r"d:\Project\SponserForge\backend\env"),
    os.path.normpath(r"d:\Project\SponserForge\backend\node_modules"),
    os.path.normpath(r"d:\Project\SponserForge\frontend\node_modules"),
    os.path.normpath(r"d:\Project\SponserForge\frontend\dist"),
    os.path.normpath(r"d:\Project\SponserForge\scratch"),
}

print("Starting zip archive creation...")
count = 0
with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(project_root):
        norm_root = os.path.normpath(root)
        
        # Check if current folder is inside any excluded directory
        if any(norm_root == exc or norm_root.startswith(exc + os.sep) for exc in exclude_dirs):
            continue
            
        # Exclude __pycache__ dynamically
        dirs[:] = [d for d in dirs if d != "__pycache__" and d != ".git"]
        
        for file in files:
            if file == "SponsorForge_Project.zip" or file.startswith("~$") or file.endswith(".pyc"):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, project_root)
            zipf.write(file_path, arcname)
            count += 1

print(f"Compressed {count} files successfully!")
size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"Zip created at: {output_zip} ({size_mb:.2f} MB)")
