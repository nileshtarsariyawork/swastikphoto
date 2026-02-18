
file_path = r'e:\NILESH\WORK\SwastikPhoto\portfolio\css\style.css'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep lines 1 to 956 (index 0 to 956)
# Line 956 in 1-based index is index 955.
# Let's check the content of line 955 (index 954) to be sure.
# Output of previous view_file says line 955 is "}" (closing the media query).
# So we want to keep up to line 956 (which is blank).

new_lines = lines[:956]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Truncated file to {len(new_lines)} lines.")
