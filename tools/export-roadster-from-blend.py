"""Run with Blender --background edited.blend --python this.py -- --out folder."""
import sys, argparse
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from roadster_export import export_exterior
parser=argparse.ArgumentParser();parser.add_argument('--out',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
export_exterior(args.out)
print('Exported edited Blender exterior without rebuilding its geometry.')
