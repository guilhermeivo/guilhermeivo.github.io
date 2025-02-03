source("../common.R")

tests <- c("javascript", "wasm")
colors <- grey.colors(2, start=0.25, end=0.9)
labels <- tests

total <- length(tests)
parts <- 0
spaces <- 0
axis_at <- c(1, 2)

pdf(file = paste("generated/boxplot", ".pdf", sep = ""),
  width = 10,
  height = 6,
  family = "serif")
nf <- layout(matrix(c(
  1, 1, 1,
  2, 2, 2,
  2, 2, 2,
  2, 2, 2,
  2, 2, 2,
  3, 3, 3), nrow=6, byrow=TRUE))

par(mar=c(0, 3, 1, 3))
plot.new()

mtext(substitute(bold(atop("Tempo de execução dos cálculos para geração da matriz",
"projectionView no NodeJs" ~ version)), 
list(version=version)), side = 3, line = -3, cex = 0.75)

list_item <- list()
for (test in tests) {
    test_data <- read.delim(paste("data/", test, ".dat", sep = ""))
    list_item <- append(list_item, list(remove_outliers(test_data$time)))
}

par(mar=c(3, 5, 0, 3))
create_boxplot("microsegundos", list_item)

plot.new()
description <- paste(
  "Removido valores atípicos (outliers)", "\n",
  "Tempo de execução é diferente do Javascript no lado do cliente, dentro do navegador",
  sep = "")
mtext(description, side = 1, line = 1, cex = 0.75, adj = 0)
mtext(readLines("data/max.txt"), side = 1, line = 1, cex = 0.75, adj = 1)

dev.off()

javascript <- mean(na.omit(list_item[[1]]))
wasm <- mean(na.omit(list_item[[2]]))
comparison <- javascript / wasm

fileConn <- file("generated/comparison.tex")
writeLines(paste(
"Javascript ", round(comparison, 0), "\\times mais lento que o Wasm.", sep=""), fileConn)
close(fileConn)