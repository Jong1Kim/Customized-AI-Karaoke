## Accompaniment seperating model
### Use spleeter model
- U-net & Bi-directional LSTM
- https://github.com/deezer/spleeter

### Conda environment setting
```
conda env create -f environments.yml
# execute in main dir
python -m spleeter separate -i input.mp3 -p spleeter:2stems -o output
```

##
## Reference
```
@article{spleeter2020,
  doi = {10.21105/joss.02154},
  url = {https://doi.org/10.21105/joss.02154},
  year = {2020},
  publisher = {The Open Journal},
  volume = {5},
  number = {50},
  pages = {2154},
  author = {Romain Hennequin and Anis Khlif and Felix Voituret and Manuel Moussallam},
  title = {Spleeter: a fast and efficient music source separation tool with pre-trained models},
  journal = {Journal of Open Source Software},
  note = {Deezer Research}
}
```
